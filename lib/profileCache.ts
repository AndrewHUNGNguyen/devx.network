import { supabaseClient } from "./supabaseClient"

// Update user metadata with profile information
export async function updateProfileCache(handle: string | null, profilePhoto: string | null) {
	const {
		data: { user }
	} = await supabaseClient.auth.getUser()

	if (!user) return

	await supabaseClient.auth.updateUser({
		data: {
			...user.user_metadata,
			profile_handle: handle,
			profile_photo: profilePhoto
		}
	})
}

// Get profile info from cached user metadata
export function getProfileFromCache(user: any): {
	handle: string | null
	profilePhoto: string | null
} {
	return {
		handle: user?.user_metadata?.profile_handle || null,
		profilePhoto: user?.user_metadata?.profile_photo || null
	}
}
