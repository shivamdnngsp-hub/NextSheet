"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signupValidator } from "@/lib/validator/authValidator";
import api from "@/lib/axios";

import { ModeToggle } from "@/components/modeToggle";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";

type SignupFormData = z.infer<typeof signupValidator>;

const  Signup = ()=> {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {user,setUser} = useAuth()

 useEffect(() => {
   if (user) {
     router.replace("/");
   }
 }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupValidator),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setServerError("");
      const res = await api.post("/auth/signup", data);
       setUser(res.data.user)
      router.replace("/");
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="w-full max-w-lg">
        <Card className="rounded-2xl shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold">
              Create Account
            </CardTitle>

            <CardDescription>
              Enter your details to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <p className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                {serverError}
              </p>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username
                </Label>

                <Input
                  id="username"
                  placeholder="Enter username"
                  {...register("userName")}
                />

                {errors.userName && (
                  <p className="text-sm text-red-500">
                    {errors.userName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="shivam@example.com"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Creating Account..."
                  : "Sign Up"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            Already have an account?
            <Link
              href="/auth/login"
              className="ml-1 font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
export default Signup