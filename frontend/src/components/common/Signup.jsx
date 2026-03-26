import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useSelector, useDispatch } from "react-redux";
import {
  signupWithVerificationThunk,
  verifySignupOTPThunk,
} from "../../slice/authSlice";
import { toast } from "react-toastify";
import { EyeOff, Eye, ArrowLeft } from "lucide-react";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "Name should contain at least 2 characters"),
    emailId: z.string().email("Invalid Email"),
    password: z
      .string()
      .min(8, "Password should contain at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password should contain at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Step 1: send OTP
  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(signupWithVerificationThunk(data));
      if (signupWithVerificationThunk.fulfilled.match(resultAction)) {
        toast.success("OTP sent to your email! Please check your inbox.");
        setPendingEmail(data.emailId);
        setOtpStep(true);
      } else {
        const errorMsg =
          resultAction.payload?.message || "Registration failed.";
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  // Step 2: verify OTP
  const onVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      const resultAction = await dispatch(
        verifySignupOTPThunk({ email: pendingEmail, otp })
      );
      if (verifySignupOTPThunk.fulfilled.match(resultAction)) {
        toast.success("Email verified! You are now logged in.");
        // isAuthenticated will become true → useEffect navigates to "/"
      } else {
        const errorMsg = resultAction.payload?.message || "Invalid OTP.";
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error("OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]"></div>

      <NavLink to="/">
        <button className="absolute top-6 left-6 hover:text-orange-400 flex items-center text-gray-400 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </NavLink>

      <div className="relative w-full max-w-md">
        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl"></div>
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-b-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {otpStep ? "Verify Your Email" : "Create Account"}
            </h1>
            <p className="text-gray-400">
              {otpStep
                ? `Enter the 6-digit OTP sent to ${pendingEmail}`
                : "Join Codexa for Coding Challenges"}
            </p>
          </div>

          {/* OTP Step */}
          {otpStep ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  OTP Code
                </label>
                <input
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                />
              </div>

              <button
                type="button"
                disabled={otpLoading}
                onClick={onVerifyOtp}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {otpLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <p className="text-center text-gray-400 text-sm">
                Didn't receive the OTP?{" "}
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="text-orange-400 hover:text-orange-300 font-semibold"
                >
                  Go back
                </button>
              </p>
            </div>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    {...register("firstName")}
                    placeholder="John Doe"
                  />
                  {errors.firstName && (
                    <span className="text-red-400 text-sm mt-1 block">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    {...register("emailId")}
                    placeholder="name@company.com"
                  />
                  {errors.emailId && (
                    <span className="text-red-400 text-sm mt-1 block">
                      {errors.emailId.message}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-12"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-red-400 text-sm mt-1 block">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 pr-12"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-400 text-sm mt-1 block">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              <p className="mt-8 text-center text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
