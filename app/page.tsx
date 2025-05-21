"use client"
import styled from "styled-components"
import { PotionBackground } from "./components/PotionBackground"
import { organizers } from "./info/organizers"

export default function Home() {
	return (
		<>
			<Main>
				<Hero>
					<PotionBackground />
					<HeroSection>
						<HeroImage src="/images/sd-devx-brand.png" alt="Developer meetup hero" />
					</HeroSection>
					<Tagline>
						<TaglineText>
							Fostering developer community through events and open-source projects in San Diego,
							California.
						</TaglineText>
					</Tagline>
				</Hero>

				{/* About Us Section */}
				<AboutSection>
					<img
						src="/images/crowd.jpg"
						alt="Big crowd"
						style={{
							width: "100%",
							height: "40rem",
							objectFit: "cover",
							borderRadius: "0.5rem",
							boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
							opacity: "0.75"
						}}
					/>
				</AboutSection>

				<ContentSection>
					<SectionTitle>About us</SectionTitle>
					<ContentWrapper>
						<ContentText>
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

				<ContentSection>
					<SectionTitle>Organizers</SectionTitle>
					<OrganizerGrid>
						{organizers.map((organizer) => (
							<OrganizerCardWrapper key={organizer.name}>
								<OrganizerImage src={organizer.imageSrc} alt={organizer.name} />
								<OrganizerName>{organizer.name}</OrganizerName>
								<SocialLink href={organizer.linkedIn} target="_blank" rel="noopener noreferrer">
									<LinkedInLogo src="/images/linkedin-logo.webp" alt="LinkedIn Logo" />
								</SocialLink>
							</OrganizerCardWrapper>
						))}
					</OrganizerGrid>
				</ContentSection>
			</Main>
		</>
	)
}

// Styled components
const Main = styled.main`
	padding: 2rem;
	color: white;
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

const AboutSection = styled.section`
	position: relative;
	margin-bottom: 3rem;
	padding: 2rem;
`

const ContentSection = styled.section`
	background-color: #0a0a0a; /* neutral-950 */
	padding: 2rem;
	border-radius: 0.5rem;
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
	margin-bottom: 3rem;
`

const SectionTitle = styled.h2`
	font-size: 1.875rem;
	font-weight: 700;
	margin-bottom: 1rem;
	text-align: center;
`

const ContentWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
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
`

const OrganizerCardWrapper = styled.div`
	background-color: #171717; /* neutral-900 */
	padding: 1.5rem;
	border-radius: 0.5rem;
	text-align: center;
`

const OrganizerImage = styled.img`
	width: 10rem;
	height: 10rem;
	object-fit: cover;
	margin: 0 auto 1rem auto;
`

const OrganizerName = styled.h3`
	font-size: 1.25rem;
	font-weight: 700;
`

const SocialLink = styled.a`
	margin-top: 0.5rem;
	font-size: 1.125rem;
	color: #60a5fa; /* blue-400 */
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
