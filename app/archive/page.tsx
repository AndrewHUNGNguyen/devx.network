"use client"
import styled from "styled-components"
import { livestreams } from "../info/livestreams"

// Components //

export default function Archive() {
	return (
		<Main>
			<ArchiveSection>
				<Title>Livestream Archive</Title>
				<ArchiveDescription>
					Watch past DEVx meetup livestreams featuring community talks and networking sessions.
				</ArchiveDescription>
				<LivestreamGrid>
					{livestreams.map((stream, index) => (
						<LivestreamCard key={stream.id}>
							<DateLabel>{stream.date}</DateLabel>
							<VideoContainer>
								<iframe
									src={`https://www.youtube.com/embed/${stream.id}`}
									title={stream.title}
									width="100%"
									height="100%"
									allowFullScreen
									frameBorder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								></iframe>
							</VideoContainer>
							<StreamInfo>
								<StreamTitle>{stream.title}</StreamTitle>
								<StreamDescription>{stream.description}</StreamDescription>
							</StreamInfo>
						</LivestreamCard>
					))}
				</LivestreamGrid>
				<ButtonSection>
					<ViewAllButton
						href="https://www.youtube.com/@DEVxNetwork/streams"
						target="_blank"
						rel="noopener noreferrer"
					>
						See All Livestreams
					</ViewAllButton>
				</ButtonSection>
			</ArchiveSection>
		</Main>
	)
}

const Main = styled.main`
	padding-top: 5rem;
	min-height: 100vh;
	& ~ footer {
		display: none;
	}
`

const ArchiveSection = styled.section`
	background-color: transparent;
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

const ArchiveDescription = styled.p`
	margin-top: 0.5rem;
	font-size: 1.25rem;
	text-align: center;
	max-width: 60rem;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 3rem;
	color: #d1d5db;
`

const LivestreamGrid = styled.div`
	display: flex;
	flex-direction: column;
	gap: 3rem;
	width: 100%;
`

const LivestreamCard = styled.div`
	display: flex;
	flex-direction: column;
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 0.5rem;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.1);
`

const DateLabel = styled.div`
	background-color: black;
	color: white;
	padding: 0.75rem 1rem;
	font-weight: 600;
	font-size: 1rem;
`

const VideoContainer = styled.div`
	width: 100%;
	height: 400px;
	position: relative;

	@media (min-width: 768px) {
		height: 500px;
	}
`

const StreamInfo = styled.div`
	padding: 1.5rem;
`

const StreamTitle = styled.h3`
	font-size: 1.5rem;
	font-weight: bold;
	margin-bottom: 0.75rem;
	color: white;
`

const StreamDescription = styled.p`
	font-size: 1rem;
	line-height: 1.6;
	color: #d1d5db;
`

const ButtonSection = styled.div`
	margin-top: 3rem;
	display: flex;
	justify-content: center;
`

const ViewAllButton = styled.a`
	background-color: white;
	color: black;
	padding: 15px 30px;
	border-radius: 0.25rem;
	text-decoration: none;
	display: inline-block;
	font-weight: 600;
	font-size: 1.1rem;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #e5e5e5;
	}
`
