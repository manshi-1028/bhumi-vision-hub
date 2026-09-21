/*
# Restrict approve_submission function to authenticated only

The SECURITY DEFINER function approve_submission was executable by the anon role.
This migration revokes anon execute and keeps it for authenticated only.
The function body already checks auth.uid() against the profiles table for the
official role, so anon calls would fail anyway, but this is defense in depth.
*/

REVOKE EXECUTE ON FUNCTION approve_submission(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION approve_submission(uuid, text) TO authenticated;