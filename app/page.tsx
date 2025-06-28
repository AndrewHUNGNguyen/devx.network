"use client"
import styled from "styled-components"
import { PotionBackground } from "./components/PotionBackground"
import { organizers } from "./info/organizers"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { links } from "./siteConfig"

export default function Home() {
	const { scrollYProgress } = useScroll()
	const springScroll = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	})

	// Pre-compute all transforms
	const backgroundColor = useTransform(
		springScroll,
		[0, 0.2, 0.8, 1],
		["#00000000", "#00000022", "#00000022", "#00000000"]
	)

	const heroOpacity = useTransform(springScroll, [0, 0.2], [1, 0])
	const heroScale = useTransform(springScroll, [0, 0.2], [1, 0.95])

	const start = 0.35
	const midStart = 0.5
	const midEnd = 0.55
	const end = 0.6
	const crowdImageScale = useTransform(
		scrollYProgress,
		[start, midStart, midEnd, end],
		[1.1, 1, 1, 0.9]
	)
	const crowdImageOpacity = useTransform(
		scrollYProgress,
		[start, midStart, midEnd, end],
		[0, 1, 1, 0]
	)
	const aboutScale = useTransform(scrollYProgress, [start, midStart, midEnd, end], [1.1, 1, 1, 0.9])
	const aboutOpacity = useTransform(scrollYProgress, [start, midStart, midEnd, end], [0, 1, 1, 0])

	return (
		<>
			<BackgroundContainer>
				<PotionBackground />
				<motion.div
					style={{
						backgroundColor: backgroundColor,
						position: "absolute",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh"
					}}
				/>
			</BackgroundContainer>
			<Main>
				<Hero>
					<HeroSection
						style={{
							opacity: heroOpacity,
							scale: heroScale
						}}
						as={motion.section}
					>
						<HeroImage src="/images/sd-devx-brand.png" alt="Developer meetup hero" />
					</HeroSection>
					<Tagline
						style={{
							opacity: heroOpacity,
							scale: heroScale
						}}
						as={motion.section}
					>
						<TaglineText>
							A developer community of events and open-source projects in San Diego, California.
						</TaglineText>
					</Tagline>
				</Hero>

				<ContentSection
					as={motion.section}
					style={{
						overflow: "hidden",
						height: "100vh",
						display: "flex",
						alignItems: "center"
					}}
				>
					<motion.h1
						style={{
							fontSize: "10vh",
							whiteSpace: "nowrap",
							position: "relative",
							x: useTransform(scrollYProgress, [0.1, 0.22], ["100vw", "0vw"], { clamp: true }),
							opacity: useTransform(scrollYProgress, [0.1, 0.22, 0.26, 0.36], [0, 1, 1, 0], {
								clamp: true
							})
						}}
					>
						BUILD
					</motion.h1>
					<motion.h1
						style={{
							fontSize: "10vh",
							whiteSpace: "nowrap",
							position: "relative",
							x: useTransform(scrollYProgress, [0.22, 0.24], ["100vw", "0vw"], { clamp: true }),
							opacity: useTransform(scrollYProgress, [0.22, 0.24, 0.28, 0.38], [0, 1, 1, 0], {
								clamp: true
							})
						}}
					>
						CONNECT
					</motion.h1>
					<motion.h1
						style={{
							fontSize: "10vh",
							whiteSpace: "nowrap",
							position: "relative",
							x: useTransform(scrollYProgress, [0.24, 0.26], ["100vw", "0vw"], { clamp: true }),
							opacity: useTransform(scrollYProgress, [0.24, 0.26, 0.3, 0.4], [0, 1, 1, 0], {
								clamp: true
							})
						}}
					>
						EMPOWER
					</motion.h1>
				</ContentSection>

				<ContentSection as={motion.section} style={{}}>
					<SectionTitle as={motion.h2}>About us</SectionTitle>
					<ContentWrapper>
						<motion.img
							src="/images/crowd.jpg"
							alt="Big crowd"
							style={{
								width: "40vw",
								objectFit: "cover",
								borderRadius: "0.5rem",
								boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
								scale: crowdImageScale,
								opacity: crowdImageOpacity
							}}
						/>
						<ContentText
							style={{
								opacity: aboutOpacity,
								scale: aboutScale
							}}
							as={motion.p}
						>
							{`We're a community of developers of all skill levels, dedicated to fostering a fun and
							educational environment. Hosted by a team of passionate organizers, our
							monthly meetups offer an opportunity to network, learn, and showcase community projects. At
							each event, you'll enjoy complimentary food and drinks during our networking lunch,
							followed by a series of engaging presentations on various developer and engineering
							topics. After the talks, we break into groups for casual networking, project showcases,
							and coding help. Whether you're a seasoned developer or just starting out, there's
							something for everyone. Be sure to bring your laptop if you'd like to share your latest
							project or give a presentation. We look forward to meeting you and seeing what you're
							excited about!`}
						</ContentText>
					</ContentWrapper>
				</ContentSection>

				<ContentSection as={motion.section} style={{}}>
					<SectionTitle as={motion.h2}>Organizers</SectionTitle>
					<ContentWrapper>
						<OrganizerGrid>
							{organizers.map((organizer) => (
								<OrganizerCardWrapper
									as={motion.div}
									key={organizer.name}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.5,
										ease: "easeOut"
									}}
									whileHover={{ scale: 1.1 }}
								>
									<OrganizerImage src={organizer.imageSrc} alt={organizer.name} />
									<OrganizerName>{organizer.name}</OrganizerName>
									<SocialLink href={organizer.linkedIn} target="_blank" rel="noopener noreferrer">
										<LinkedInLogo src="/images/linkedin-logo.webp" alt="LinkedIn Logo" />
									</SocialLink>
								</OrganizerCardWrapper>
							))}
						</OrganizerGrid>
					</ContentWrapper>
				</ContentSection>

				<ContentSection as={motion.section} style={{}}>
					<SectionTitle as={motion.h2}>Join us</SectionTitle>
					<ContentWrapper>
						<ContentText>
							<Button target="_blank" href={links.lumaUrl}>
								View Upcoming Events
							</Button>
						</ContentText>
					</ContentWrapper>
				</ContentSection>
			</Main>
		</>
	)
}

// Styled components
const Main = styled.main`
	color: white;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

const Button = styled.a`
	background-color: white;
	color: black;
	padding: 1rem 2rem;
	border-radius: 0.5rem;
	border: none;
	font-size: 1.25rem;
	cursor: pointer;

	&:hover {
		background-color: #ddd;
	}
`

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

const Hero = styled.section`
	position: relative;
	height: 100vh;
	width: 100vw;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

const HeroSection = styled.section`
	position: relative;
`

const HeroImage = styled.img`
	width: 100%;
	max-width: 688px;
	margin: 0 auto;
`

const Tagline = styled.section`
	padding: 3rem;
	border-radius: 0.5rem;
`

const TaglineText = styled.p`
	font-size: 1.25rem;
	text-align: center;
	max-width: 1024px;
`

const ContentSection = styled.section`
	position: relative;
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 4rem;
	box-sizing: border-box;
`

const SectionTitle = styled.h2`
	font-size: clamp(2rem, 8vw, 4rem);
	font-weight: 700;
	margin: 0;
`

const ContentWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 5rem;
	padding: 5rem;
`

const ContentText = styled.p`
	margin-top: 0.5rem;
	font-size: 1.25rem;
	text-align: center;
	max-width: 1024px;
`

const OrganizerGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 1.5rem;
	width: 100%;
`

const OrganizerCardWrapper = styled.div`
	background-color: rgba(255, 255, 255, 0.02);
	padding: 3rem;
	border-radius: 0.5rem;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	min-width: 250px;
`

const OrganizerImage = styled.img`
	width: 8rem;
	height: 8rem;
	object-fit: cover;
	border-radius: 50%;
	margin: 0 auto 0.5rem auto;
`

const OrganizerName = styled.h3`
	font-size: 1.25rem;
	font-weight: 700;
`

const SocialLink = styled.a`
	margin-top: 0.5rem;
	font-size: 1.125rem;
	color: #60a5fa;
	display: inline-flex;
	align-items: center;

	&:hover {
		text-decoration: underline;
	}
`

const LinkedInLogo = styled.img`
	height: 3rem;
	width: 3rem;
	margin-left: 0.5rem;
`
