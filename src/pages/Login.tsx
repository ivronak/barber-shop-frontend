import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      console.log(
        "User authenticated, role:",
        userRole,
        "redirecting from:",
        from
      );

      if (userRole === "admin") {
        navigate(from || "/admin/dashboard", { replace: true });
      } else if (userRole === "staff") {
        // For staff users, first ensure we have their complete profile
        console.log("Staff user authenticated, navigating to staff dashboard");
        navigate(from || "/staff/dashboard", { replace: true });
      } else if (userRole === "billing") {
        navigate(from || "/billing/dashboard", { replace: true });
      } else {
        console.warn("Unknown user role:", userRole);
        // Default to login page if role is unknown
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, location]);

  useEffect(() => {
    // If user was redirected to login page after logout,
    // show a message to indicate successful logout
    if (location.state?.from?.pathname && location.state?.logout) {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }

    // If user was redirected due to token expiration
    if (location.state?.tokenExpired) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
    }
  }, [location, toast]);

  // Apply admin theme class on mount
  useEffect(() => {
    document.documentElement.classList.add("admin-theme");
    return () => document.documentElement.classList.remove("admin-theme");
  }, []);

  const onSubmit = async (
    values: z.infer<typeof formSchema>,
    event?: React.BaseSyntheticEvent
  ) => {
    // Prevent default form submission behavior which would cause page refresh
    if (event) {
      event.preventDefault();
    }

    try {
      setIsLoading(true);
      console.log("Attempting login with email:", values.email);

      await login(values.email, values.password);

      // Get the current user role after login
      const currentRole = userRole;

      // Log additional information for debugging
      console.log("Login successful, user role:", currentRole);

      toast({
        title: "Success",
        description: "Welcome back!",
      });

      // Navigation will be handled by the useEffect
    } catch (error) {
      let errorMessage = "Invalid email or password";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Login error details:", error);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Don't redirect on error
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, we'll keep the mock users option
  const loginWithMockUser = (
    role: "admin" | "staff" | "billing",
    event?: React.MouseEvent
  ) => {
    // Prevent any default behavior
    if (event) {
      event.preventDefault();
    }

    let email = "";
    let password = "";

    if (role === "admin") {
      email = "admin@barbershop.com";
      password = "admin123";
    } else if (role === "staff") {
      email = "ronak@gmail.com";
      password = "123456789";
    } else if (role === "billing") {
      email = "utsav@barbershop.com";
      password = "billing123";
    }

    form.setValue("email", email);
    form.setValue("password", password);

    // Call onSubmit directly instead of using form.handleSubmit
    onSubmit({ email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative admin"
      style={{
        backgroundImage:
          "url(https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1920)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Centered glass card */}
      <Card className="relative z-10 w-full max-w-[420px] bg-black/60 backdrop-blur-lg border border-white/20 shadow-2xl rounded-xl text-white">
        <CardHeader className="text-center items-center py-1">
          <img
            src="/logo/logo-tran.png"
            alt="Barber Shop Logo"
            className="h-[15rem] w-auto drop-shadow-lg"
          />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit((values) => onSubmit(values, e))();
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                        disabled={isLoading}
                        className="bg-white/10 placeholder:text-white/60 text-white border-white/30 focus-visible:ring-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                        disabled={isLoading}
                        className="bg-white/10 placeholder:text-white/60 text-white border-white/30 focus-visible:ring-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-sm text-muted-foreground items-center">
          <div className="text-center w-full">
            Demo credentials:
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => loginWithMockUser("admin", e)}
                disabled={isLoading}
              >
                Login as Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => loginWithMockUser("staff", e)}
                disabled={isLoading}
              >
                Login as Staff
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => loginWithMockUser("billing", e)}
                disabled={isLoading}
              >
                Login as Billing
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
