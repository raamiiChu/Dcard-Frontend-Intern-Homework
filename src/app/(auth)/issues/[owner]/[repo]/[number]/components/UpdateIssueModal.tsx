"use client";

import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import axios from "axios";
import { useSession } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import TurndownService from "turndown";
import { marked } from "marked";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { FaRegEdit } from "react-icons/fa";

import Swal from "sweetalert2";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});

const formSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }),
    body: z.string().min(30, {
        message: "Body must be at least 30 characters.",
    }),
});

interface T {
    params: {
        owner: string;
        repo: string;
        number: number;
    };

    issue: {
        title: string;
        body: string;
    };

    mutate: () => void;
}

const UpdateIssueModal = ({ params, issue, mutate }: T) => {
    const { owner, repo, number } = params;
    const { title, body } = issue;

    const [open, setOpen] = useState<boolean>(false);
    const { data: session } = useSession();

    // console.log(issue.body);
    // const html = marked.parse();
    // Define the form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title,
            body: marked.parse(body),
        },
    });

    // Define a submit handler.
    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const { title, body } = values;

        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(body);

        Swal.fire({
            icon: "info",
            title: "Updating Issue",
            text: "Please wait...",
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const { status } = await axios.patch(
                `/api/github/issues/${owner}/${repo}/${number}`,
                { title, body: markdown },
                { headers: { Authorization: session?.accessToken } }
            );

            Swal.close();

            if (status === 200) {
                Toast.fire({
                    icon: "success",
                    title: "Update successfully",
                });

                mutate();

                setOpen(false);
            }
        } catch (error: any) {
            Swal.close();

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something error",
            });

            console.log(error.response);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="fixed bottom-10 right-16 px-3 py-6 rounded-full text-black bg-white border-2 border-black dark:border-white transition-all hover:text-white hover:bg-black"
                >
                    <FaRegEdit className="text-2xl" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-[600px] ">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Post an Issue
                    </DialogTitle>
                    <DialogDescription>
                        Create an issue here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-bold">
                                        Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="title"
                                            {...field}
                                            className="placeholder:text-slate-400"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is your title.
                                    </FormDescription>
                                    <FormMessage className="text-red-500 font-bold" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-bold">
                                        Body
                                    </FormLabel>
                                    <FormControl className="h-40">
                                        <ReactQuill
                                            theme="snow"
                                            placeholder="body"
                                            {...field}
                                            className=" placeholder:text-slate-400"
                                        />
                                    </FormControl>
                                    <FormDescription className="pt-12">
                                        This is your body.
                                    </FormDescription>
                                    <FormMessage className="text-red-500 font-bold" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                className="px-5 py-2.5 border border-black rounded bg-white text-black font-bold hover:bg-black hover:text-white transition-all duration-500"
                            >
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateIssueModal;
