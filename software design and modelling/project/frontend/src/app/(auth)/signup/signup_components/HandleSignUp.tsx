import { toast } from "react-hot-toast";

interface HandleSignUp {
  validateForm: (data: SignupFormData) => boolean;
  getStrength: (pass: string) => number;
}

interface SignupFormData {
  first_name: string;
  last_name: string | null;
  email: string;
  password: string;
  confirmPassword: string;
}

const HandleSignUp = () => {
  const validateForm = (data: SignupFormData): boolean => {
    if (!data.first_name.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!data.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!data.password) {
      toast.error("Password is required");
      return false;
    }
    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!data.confirmPassword) {
      toast.error("Please confirm your password");
      return false;
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const getStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  return {
    validateForm,
    getStrength
  };
}

export default HandleSignUp
