"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const GithubAuthButton = () => {
    const { status } = useSession();

    if (status === "loading") {
        return (
            <button
                disabled
                className="col-span-2 px-5 py-1.5 border border-black rounded bg-white opacity-30 text-black font-bold hover:cursor-not-allowed"
            >
                Loading
            </button>
        );
    }

    if (status === "authenticated") {
        return (
            <button
                className="col-span-2 px-5 py-1.5 border border-black rounded bg-white text-black font-bold hover:opacity-75"
                onClick={() => {
                    signOut();
                }}
            >
                Logout
            </button>
        );
    }

    return (
        <button
            className="col-span-2 px-5 py-1.5 border border-black rounded bg-white text-black font-bold hover:opacity-75"
            onClick={() => {
                signIn("github");
            }}
        >
            Login
        </button>
    );
};

export default GithubAuthButton;
