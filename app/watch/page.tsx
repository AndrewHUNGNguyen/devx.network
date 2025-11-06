"use client"
import { useMemo } from "react"
import styled from "styled-components"
import { talks } from "../info/talks"
import { PotionBackground } from "../components/PotionBackground"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { Button } from "../components/Button"

// Types

interface Talk {
	videoId: string
	speaker: string
	title: string
	date: string
	year: number
	startTime: string
	endTime: string
}

// Components

export default function Watch() {
	// Memoize video processing: sort by date, partition featured vs archive
	const { featuredTalks, talksByYear, years } = useMemo(() => {
		const sorted = [...talks].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		)

		// Show 3 most recent talks in hero
		const featured = sorted.slice(0, 3)
		const remaining = sorted.slice(3)

		// Group remaining talks by year (excludes featured)
		const grouped = remaining.reduce(
			(acc: Record<number, Talk[]>, talk) => {
				if (!acc[talk.year]) acc[talk.year] = []
				acc[talk.year].push(talk)
				return acc
			},
			{} as Record<number, Talk[]>
		)

		const sortedYears = Object.keys(grouped)
			.map(Number)
			.sort((a, b) => b - a)

		return {
			featuredTalks: featured,
			talksByYear: grouped,
			years: sortedYears
		}
	}, [])

	return (
		<>
			<BackgroundContainer>
				<ErrorBoundary
					fallback={<div style={{ backgroundColor: "black", width: "100%", height: "100%" }} />}
				>
					<PotionBackground />
				</ErrorBoundary>
			</BackgroundContainer>
			<Main>
				{/* Hero section: intro blurb + featured talks grid */}
				<HeroSection>
					<HeroBlurb>
						{`DEVx brings developers together to share ideas and spark conversations.
Our monthly events feature talks on topics in software development and engineering.
Explore our collection of presentations from the community.`}
					</HeroBlurb>

					{/* 3 most recent talks displayed as cards */}
					<FeaturedGrid>
						{featuredTalks.map((talk) => (
							<FeaturedCard key={`${talk.videoId}-${talk.speaker}`}>
								<ThumbnailLink
									href={buildYouTubeUrl(talk.videoId, talk.startTime)}
									target="_blank"
									rel="noopener noreferrer"
								>
									<HeroThumbnailContainer>
										<HeroThumbnailImage src={getYouTubeThumbnail(talk.videoId)} alt={talk.title} />
										<HeroPlayButton>▶</HeroPlayButton>
									</HeroThumbnailContainer>
								</ThumbnailLink>
								<FeaturedInfo>
									<FeaturedTitle>{talk.title}</FeaturedTitle>
									<FeaturedSpeaker>{talk.speaker}</FeaturedSpeaker>
								</FeaturedInfo>
							</FeaturedCard>
						))}
					</FeaturedGrid>
				</HeroSection>

				<WatchSection>
					{years.map((year) => {
						const yearTalks = talksByYear[year]

						if (yearTalks.length === 0) return null

						return (
							<YearSection key={year}>
								<YearHeader>{year}</YearHeader>

								{/* Render all talks in grid */}
								<LivestreamGrid>
									{yearTalks.map((talk: Talk) => (
										<LivestreamCard key={`${talk.videoId}-${talk.speaker}`}>
											<ThumbnailLink
												href={buildYouTubeUrl(talk.videoId, talk.startTime)}
												target="_blank"
												rel="noopener noreferrer"
											>
												<ThumbnailContainer>
													<ThumbnailImage
														src={getYouTubeThumbnail(talk.videoId)}
														alt={talk.title}
													/>
													<PlayButton>▶</PlayButton>
												</ThumbnailContainer>
											</ThumbnailLink>
											<StreamInfo>
												<TalkTitle>{talk.title}</TalkTitle>
												<SpeakerName>{talk.speaker}</SpeakerName>
											</StreamInfo>
										</LivestreamCard>
									))}
								</LivestreamGrid>
							</YearSection>
						)
					})}
					<ButtonSection>
						<Button
							href="https://www.youtube.com/@DEVxNetwork"
							target="_blank"
							rel="noopener noreferrer"
						>
							Watch More
						</Button>
					</ButtonSection>
				</WatchSection>
			</Main>
		</>
	)
}

// Styles

const BackgroundContainer = styled.section`
	background-color: #0a0a0a;
	position: fixed;
	height: 100vh;
	width: 100vw;
	top: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

const Main = styled.main`
	position: relative;
	z-index: 1;
	& ~ footer {
		display: none;
	}
`

const WatchSection = styled.section`
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

const LivestreamGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
	width: 100%;

	@media (min-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	}

	@media (min-width: 1200px) {
		grid-template-columns: repeat(4, 1fr);
	}
`

const LivestreamCard = styled.div`
	display: flex;
	flex-direction: column;
	background-color: transparent;
	border-radius: 0.5rem;
	overflow: hidden;
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-4px);
	}
`

const ThumbnailLink = styled.a`
	display: block;
	text-decoration: none;
	position: relative;
	width: 100%;
	height: 100%;
`

const ThumbnailContainer = styled.div`
	width: 100%;
	aspect-ratio: 16/9;
	position: relative;
	overflow: hidden;
	background-color: rgba(0, 0, 0, 0.8);
	border-radius: 0.5rem;
`

const ThumbnailImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: opacity 0.2s ease;

	&:hover {
		opacity: 0.8;
	}
`

const PlayButton = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: rgba(255, 255, 255, 0.5);
	color: black;
	border-radius: 50%;
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.5rem;
	font-weight: bold;
	transition: all 0.2s ease;

	&:hover {
		background-color: rgba(255, 255, 255, 0.8);
		transform: translate(-50%, -50%) scale(1.1);
	}
`

const StreamInfo = styled.div`
	padding: 1rem 0;
`

const TalkTitle = styled.p`
	font-size: 0.9rem;
	line-height: 1.3;
	color: #d1d5db;
	margin: 0 0 0.5rem 0;
	font-weight: 500;
`

const SpeakerName = styled.p`
	font-size: 0.85rem;
	color: #9ca3af;
	margin: 0;
	font-weight: 600;
`

const ButtonSection = styled.div`
	margin-top: 3rem;
	display: flex;
	justify-content: center;
`

const HeroSection = styled.section`
	max-width: 1200px;
	width: 100%;
	min-height: 100vh;
	margin: 0 auto;
	padding: 4rem 2rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 3rem;

	@media (max-width: 968px) {
		padding: 2rem 1rem;
		gap: 2rem;
	}
`

const HeroBlurb = styled.p`
	font-size: 1.25rem;
	line-height: 1.8;
	color: #d1d5db;
	text-align: center;
	max-width: 900px;
	margin: 0;
	white-space: pre-line;

	@media (max-width: 768px) {
		font-size: 1.1rem;
		line-height: 1.6;
	}
`

const FeaturedGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 2rem;
	width: 100%;

	@media (max-width: 968px) {
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}
`

const FeaturedCard = styled.div`
	display: flex;
	flex-direction: column;
	background-color: transparent;
	border-radius: 0.5rem;
	overflow: hidden;
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-4px);
	}
`

const FeaturedInfo = styled.div`
	padding: 1rem 0;
`

const FeaturedTitle = styled.p`
	font-size: 1rem;
	line-height: 1.4;
	color: #d1d5db;
	margin: 0 0 0.5rem 0;
	font-weight: 500;
`

const FeaturedSpeaker = styled.p`
	font-size: 0.9rem;
	color: #9ca3af;
	margin: 0;
	font-weight: 600;
`

const HeroThumbnailContainer = styled.div`
	width: 100%;
	aspect-ratio: 16/9;
	position: relative;
	background-color: rgba(0, 0, 0, 0.8);
	border-radius: 0.5rem;
	overflow: hidden;
`

const HeroThumbnailImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: opacity 0.2s ease;

	&:hover {
		opacity: 0.8;
	}
`

const HeroPlayButton = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: rgba(255, 255, 255, 0.5);
	color: black;
	border-radius: 50%;
	width: 70px;
	height: 70px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.8rem;
	font-weight: bold;
	transition: all 0.2s ease;

	&:hover {
		background-color: rgba(255, 255, 255, 0.8);
		transform: translate(-50%, -50%) scale(1.1);
	}
`

const YearSection = styled.div`
	margin-bottom: 4rem;
`

const YearHeader = styled.h2`
	font-size: 2.5rem;
	font-weight: bold;
	margin-bottom: 2rem;
	text-align: center;
	color: white;
	border-bottom: 2px solid rgba(255, 255, 255, 0.2);
	padding-bottom: 1rem;
`

// Utility Functions

const buildYouTubeUrl = (id: string, startTime?: string) => {
	let url = `https://youtube.com/watch?v=${id}`

	if (startTime && startTime !== "0s") {
		url += `&t=${startTime}`
	}

	return url
}

const getYouTubeThumbnail = (id: string) => {
	// Use hqdefault for consistent availability across all videos
	return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}
