import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { formGroups } from "@/lib/grouping";
import { DBProfile } from "@/lib/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const supabase = await createClient();

  // 1. Get all attendee user_ids for this event
  const { data: attendees, error: attendeesError } = await supabase
    .from("event_attendees")
    .select("user_id")
    .eq("event_id", eventId);

  if (attendeesError) return NextResponse.json({ error: attendeesError.message }, { status: 500 });
  if (!attendees || attendees.length < 2) return NextResponse.json({ error: "Not enough attendees" }, { status: 400 });

  const userIds = attendees.map((a) => a.user_id);

  // 2. Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });
  if (!profiles || profiles.length < 2) return NextResponse.json({ error: "Not enough profiles" }, { status: 400 });

  // 3. Get event group size
  const { data: event } = await supabase
    .from("events")
    .select("max_group_size")
    .eq("id", eventId)
    .single();

  const groupSize = event?.max_group_size ?? 4;

  // 4. Delete existing groups for this event
  const { data: existingGroups } = await supabase
    .from("match_groups")
    .select("id")
    .eq("event_id", eventId);

  if (existingGroups && existingGroups.length > 0) {
    const ids = existingGroups.map((g) => g.id);
    await supabase.from("match_group_members").delete().in("group_id", ids);
    await supabase.from("match_groups").delete().eq("event_id", eventId);
  }

  // 5. Run algorithm
  const groups = formGroups(profiles as DBProfile[], groupSize);

  // 6. Save to DB
  for (const group of groups) {
    const { data: newGroup, error: groupError } = await supabase
      .from("match_groups")
      .insert({ event_id: eventId })
      .select()
      .single();

    if (groupError || !newGroup) continue;

    await supabase.from("match_group_members").insert(
      group.map((member) => ({ group_id: newGroup.id, user_id: member.id }))
    );
  }

  return NextResponse.json({ success: true, groupCount: groups.length });
}
