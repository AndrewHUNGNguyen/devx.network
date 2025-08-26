"use client"
import styled from "styled-components"

// Components //

export default function Join() {
	return (
		<Main>
			<EventSection>
				<Title>Current Events</Title>
				<EventDescription>
					Stay updated with our latest events, workshops, and meetups. Join us to network and learn
					with fellow developers.
				</EventDescription>
				<EventsGrid>
					<EventColumn>
						<EventTitle>On Lu.ma</EventTitle>
						<IframeContainer>
							<iframe
								src="https://lu.ma/embed/event/evt-UDB2YUh2bKH152P/simple"
								width="100%"
								height="100%"
								allowFullScreen
								aria-hidden="false"
							></iframe>
						</IframeContainer>
					</EventColumn>
					<EventColumn>
						<EventTitle>On Meetup.com</EventTitle>
						<MeetupLink href="https://www.meetup.com/san-diego-devx/events/301885439/?utm_medium=referral&utm_campaign=share-btn_savedevents_share_modal&utm_source=link">
							<MeetupImage
								src="https://secure.meetupstatic.com/photos/event/5/0/b/c/600_519680668.webp?w=384"
								alt="Meetup Event"
							/>
						</MeetupLink>
					</EventColumn>
				</EventsGrid>
				<DiscordSection>
					<DiscordTitle>Join Our Discord</DiscordTitle>
					<DiscordButtonContainer>
						<DiscordButton
							href="https://discord.gg/rmbT75CB"
							target="_blank"
							rel="noopener noreferrer"
						>
							DEVx Discord
						</DiscordButton>
					</DiscordButtonContainer>
				</DiscordSection>
			</EventSection>
		</Main>
	)
}

const Main = styled.main`
	padding-top: 5rem;
	min-height: 100vh;
`

const EventSection = styled.section`
	background-color: #1f2937;
	padding: 2rem;
	border-radius: 0.5rem;
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
	margin-bottom: 3rem;
	max-width: 1200px;
	margin-left: auto;
	margin-right: auto;
`

const Title = styled.h2`
	font-size: 1.875rem;
	font-weight: bold;
	margin-bottom: 1rem;
	text-align: center;
	color: white;
`

const EventDescription = styled.p`
	margin-top: 0.5rem;
	font-size: 1.25rem;
	text-align: center;
	max-width: 60rem;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 3rem;
	color: #d1d5db;
`

const EventsGrid = styled.div`
	display: flex;
	justify-content: center;
	gap: 1.5rem;
	width: 100%;
	flex-direction: column;

	@media (min-width: 768px) {
		flex-direction: row;
	}
`

const EventColumn = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	height: 600px;
	overflow: hidden;
`

const EventTitle = styled.h2`
	font-size: 1.875rem;
	font-weight: bold;
	margin-bottom: 1rem;
	text-align: center;
	color: white;
`

const IframeContainer = styled.div`
	width: 100%;
	height: 100%;
	flex: 1;
`

const MeetupLink = styled.a`
	width: 100%;
	height: 100%;
	display: block;
`

const MeetupImage = styled.img`
	width: 100%;
	height: 600px;
	object-fit: cover;
`

const DiscordSection = styled.div`
	margin-top: 3rem;
`

const DiscordTitle = styled.h2`
	margin-top: 3rem;
	font-size: 1.875rem;
	font-weight: bold;
	margin-bottom: 1rem;
	text-align: center;
	color: white;
`

const DiscordButtonContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

const DiscordButton = styled.a`
	background-color: #5865f2;
	color: white;
	padding: 15px 20px;
	border-radius: 1px;
	text-decoration: none;
	display: inline-block;
	font-weight: 500;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #4752c4;
	}
`
