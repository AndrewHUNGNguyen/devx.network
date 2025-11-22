-- Add length constraints to talk_submissions table
ALTER TABLE talk_submissions
ADD CONSTRAINT talk_title_length CHECK (
	LENGTH(talk_title) >= 10 AND LENGTH(talk_title) <= 200
);

ALTER TABLE talk_submissions
ADD CONSTRAINT talk_synopsis_length CHECK (
	LENGTH(talk_synopsis) >= 100 AND LENGTH(talk_synopsis) <= 2000
);

ALTER TABLE talk_submissions
ADD CONSTRAINT slides_url_length CHECK (
	slides_url IS NULL OR LENGTH(slides_url) <= 2048
);

-- Add phone number constraint to profiles table
ALTER TABLE profiles
ADD CONSTRAINT phone_number_length CHECK (
	phone_number IS NULL OR LENGTH(phone_number) <= 20
);

