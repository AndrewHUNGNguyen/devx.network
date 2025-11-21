-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.member (email, full_name)
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  
  -- Also create the profile entry linked to the member
  -- We need to get the ID of the newly created member
  -- But member_profile references member(id), and member.id is BIGSERIAL.
  -- So we need to do this in a way that captures the new member ID.
  
  INSERT INTO public.member_profile (member_id, profile_photo)
  SELECT id, NEW.raw_user_meta_data->>'avatar_url'
  FROM public.member
  WHERE email = NEW.email
  ORDER BY id DESC
  LIMIT 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

