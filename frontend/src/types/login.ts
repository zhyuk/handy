export type LoginRequest = { phone: string; password: string; };

export interface SignupForm {
    phone: string;
    name: string;
    birth: string;
    gender: string;
    password: string;
}

export type Step = 1 | 2 | 3 | 4 | 5;

export interface Props {
    setStep: (step: Step) => void;
    form: SignupForm;
    setForm: React.Dispatch<React.SetStateAction<SignupForm>>;
}