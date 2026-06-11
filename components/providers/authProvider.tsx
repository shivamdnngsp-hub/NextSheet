"use client"

import { AuthContext } from "@/context/authContex";
import api from "@/lib/axios";
import { useEffect, useState } from "react"
import { Spinner } from "../ui/spinner";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                const res = await api.get("/auth/me");
                console.log(res.data)
                setUser(res.data.user)
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }

        }
        fetchUser()
    }, [])


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner className="size-8"></Spinner>
            </div>
        );
    }

    return (

        <>
            <AuthContext.Provider value={{ user, setUser,loading}}>
                {children}
            </AuthContext.Provider>
        </>
    )

}
export default AuthProvider