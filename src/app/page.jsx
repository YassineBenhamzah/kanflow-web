'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LayoutTemplate, Zap, Shield, Users, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const FEATURES = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Drag-and-drop tasks between columns instantly. Changes save in real-time.',
        gradient: 'from-yellow-500 to-orange-500',
    },
    {
        icon: Shield,
        title: 'Secure by Design',
        description: 'Enterprise-grade authentication with encrypted tokens and role-based access.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        icon: Users,
        title: 'Team Collaboration',
        description: 'Invite team members to boards and work together seamlessly.',
        gradient: 'from-blue-500 to-cyan-500',
    },
];

const STEPS = [
    { step: '01', title: 'Create a Board', desc: 'Set up your project workspace in seconds' },
    { step: '02', title: 'Add Your Tasks', desc: 'Break down work into manageable pieces' },
    { step: '03', title: 'Drag & Organize', desc: 'Move tasks across columns as you progress' },
];

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <LayoutTemplate className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">KanFlow</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => router.push('/register')}
                        className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                    >
                        Get Started Free
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-8">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-300">Now with drag-and-drop</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
                            Manage projects
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                like never before
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            KanFlow is the beautifully simple Kanban board that helps you organize tasks,
                            track progress, and ship faster — without the bloat.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => router.push('/register')}
                                className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/25"
                            >
                                Start for Free
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="text-zinc-400 hover:text-white font-medium px-6 py-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
                            >
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Board Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative max-w-5xl mx-auto mt-20"
                >
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
                        {/* Mini Board Header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            <span className="ml-3 text-sm font-medium text-zinc-500">Sprint Planning</span>
                        </div>

                        {/* Mini Columns */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { name: 'To Do', tasks: ['Design landing page', 'Set up CI/CD', 'Write API docs'] },
                                { name: 'In Progress', tasks: ['Build auth flow', 'Create DB schema'] },
                                { name: 'Done', tasks: ['Init project repo', 'Configure deployment'] },
                            ].map((col) => (
                                <div key={col.name} className="bg-zinc-950/50 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-semibold text-zinc-400">{col.name}</span>
                                        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">{col.tasks.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {col.tasks.map((task) => (
                                            <div key={task} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5">
                                                <p className="text-xs font-medium text-zinc-300">{task}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Decorative Gradient */}
                    <div className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                </motion.div>
            </section>

            {/* Features */}
            <section className="py-24 px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to stay organized</h2>
                        <p className="text-zinc-500 text-lg max-w-xl mx-auto">Powerful features wrapped in a beautifully simple interface.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 px-8 bg-zinc-900/20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Get started in 3 steps</h2>
                        <p className="text-zinc-500 text-lg">From zero to organized in under a minute.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {STEPS.map((step, i) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="text-center"
                            >
                                <div className="text-5xl font-black bg-gradient-to-b from-zinc-700 to-zinc-900 bg-clip-text text-transparent mb-4">
                                    {step.step}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-zinc-500">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get organized?</h2>
                        <p className="text-zinc-400 text-lg mb-8">Join KanFlow today and experience the easiest way to manage your projects.</p>
                        <button
                            onClick={() => router.push('/register')}
                            className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-500/25"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Create Free Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-800/50 py-8 px-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <LayoutTemplate className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-500">KanFlow</span>
                    </div>
                    <p className="text-xs text-zinc-700">© 2026 KanFlow. Built with Next.js & Laravel.</p>
                </div>
            </footer>
        </div>
    );
}
