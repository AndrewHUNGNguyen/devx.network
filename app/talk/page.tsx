"use client"
import styled from "styled-components"

// Components //

export default function Talk() {
	return (
		<Main>
			<FormContainer action="/api/talk-requests" method="POST">
				<Input type="text" placeholder="Speaker Name" name="speaker" />
				<Input type="text" placeholder="Talk Title" name="title" />
				<TextArea placeholder="Talk Description..." name="description"></TextArea>
				<ButtonContainer>
					<ResetButton type="reset" value="Reset" />
					<SubmitButton>Submit</SubmitButton>
				</ButtonContainer>
			</FormContainer>
		</Main>
	)
}

const Main = styled.main`
	padding-top: 5rem;
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
`

const FormContainer = styled.form`
	width: 100%;
	max-width: 48rem;
	margin: 0 auto;
	padding: 2rem;
	background-color: rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(10px);
	border-radius: 0.5rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	flex-direction: column;
	gap: 1rem;

	@media (min-width: 640px) {
		padding: 3rem;
	}
`

const Input = styled.input`
	padding: 0.75rem;
	border-radius: 0.375rem;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background-color: rgba(255, 255, 255, 0.1);
	color: white;
	font-size: 1rem;
	transition: all 0.2s ease;

	&:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.4);
		background-color: rgba(255, 255, 255, 0.15);
	}

	&::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}
`

const TextArea = styled.textarea`
	padding: 0.75rem;
	border-radius: 0.375rem;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background-color: rgba(255, 255, 255, 0.1);
	color: white;
	font-size: 1rem;
	min-height: 150px;
	resize: vertical;
	transition: all 0.2s ease;

	&:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.4);
		background-color: rgba(255, 255, 255, 0.15);
	}

	&::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}
`

const ButtonContainer = styled.div`
	display: flex;
	gap: 1rem;
	margin-top: 1rem;
`

const Button = styled.button`
	padding: 0.75rem 1.5rem;
	border-radius: 0.375rem;
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
`

const ResetButton = styled.input`
	padding: 0.75rem 1.5rem;
	border-radius: 0.375rem;
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid rgba(255, 255, 255, 0.3);
	background-color: transparent;
	color: white;

	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.5);
	}
`

const SubmitButton = styled(Button)`
	background-color: #8b5cf6;
	color: white;

	&:hover {
		background-color: #7c3aed;
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
	}
`
