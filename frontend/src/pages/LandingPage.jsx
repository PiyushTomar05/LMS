import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle,
    ArrowRight,
    Users,
    BookOpen,
    Shield,
    BarChart2,
    Calendar,
    Globe,
    Zap,
    Download,
    MessageCircle,
    ChevronDown,
    Plus,
    Minus
} from 'lucide-react';

const LandingPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        { q: "How long does setup take?", a: "Most schools are up and running within 48 hours. Our onboarding team handles the heavy lifting of data migration." },
        { q: "Can we integrate with our current systems?", a: "Yes, EduManager offers a robust API and built-in connectors for popular student information systems and accounting software." },
        { q: "Is our data secure?", a: "Absolutely. We use bank-grade AES-256 encryption and are fully SOC2 and GDPR compliant." },
        { q: "Do you offer training for teachers?", a: "Yes, every plan includes unlimited access to our training academy and scheduled live webinars for your staff." }
    ];

    return (
        <div className="font-sans text-slate-900 bg-white selection:bg-primary-100 selection:text-primary-700">
            {/* Mesh Gradient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-200/30 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-200/20 blur-[100px] rounded-full animate-float-delayed"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-100/40 blur-[150px] rounded-full"></div>
            </div>

            {/* Navbar */}
            <nav className="border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-slate-900">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                            <BookOpen size={24} />
                        </div>
                        EduManager
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
                        <a href="#pricing" className="hover:text-primary-600 transition-colors">Pricing</a>
                        <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
                    </div>

                    <div className="flex items-center gap-5">
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/login" className="group px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-xl flex items-center gap-2">
                            Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold mb-8 animate-fade-in">
                            <Zap size={14} /> <span>Trusted by 500+ Institutions Worldwide</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9] lg:leading-[0.85]">
                            Education admin <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">reimagined.</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-12 font-medium leading-relaxed">
                            The intelligent platform for modern schools. Automate grading, track progress, and empower your educators with state-of-the-art tools.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/25 flex items-center justify-center gap-2 group">
                                Start Your Mission <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="w-full sm:w-auto px-10 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <Download size={20} /> Case Study
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Visual */}
                    <div className="relative mx-auto max-w-6xl">
                        <div className="absolute inset-0 bg-primary-500/10 blur-[100px] -z-10 rounded-full"></div>
                        <div className="rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-4 border-white overflow-hidden bg-slate-900 transform lg:rotate-1 hover:rotate-0 transition-transform duration-700">
                            <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                                <div className="flex-1 text-center text-[10px] text-slate-500 font-mono">dashboard.edumanager.io</div>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                                alt="Dashboard Preview"
                                className="w-full grayscale-[20%] opacity-90"
                            />
                        </div>

                        {/* Floating Stats Card */}
                        <div className="absolute -bottom-10 -left-10 hidden lg:block bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 animate-float">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Success Rate</p>
                                    <p className="text-2xl font-black text-slate-900">+12.5%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Trusted by modern educational district leaders</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale transition-all hover:grayscale-0">
                        {['University of Oxford', 'MIT', 'Stanford', 'Cambridge', 'Harvard'].map((name) => (
                            <span key={name} className="text-2xl font-bold text-slate-400 italic font-serif">{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Breakdown */}
            <section id="features" className="py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Everything built for <br />institutional excellence</h2>
                            <p className="text-slate-500 text-lg font-medium">We've spent years obsessing over the details so you don't have to. Every feature is designed to save time and reduce friction.</p>
                        </div>
                        <Link to="/login" className="text-primary-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                            Explore All Features <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { icon: Users, title: 'Student Intelligence', desc: 'Predictive analytics to identify at-risk students before exams even begin.' },
                            { icon: Zap, title: 'Workflow Automation', desc: 'Auto-generate timetables, report cards, and attendance alerts with one click.' },
                            { icon: Shield, title: 'Ironclad Security', desc: 'Role-based encryption ensures student data never falls into the wrong hands.' },
                            { icon: MessageCircle, title: 'Real-time Comms', desc: 'Direct channel between parents, teachers, and students for instant feedback.' },
                            { icon: Globe, title: 'Hyper-Scale Infrastructure', desc: 'Cloud-native architecture that scales to millions of students instantly.' },
                            { icon: BarChart2, title: 'Custom Dashboards', desc: 'Build the views you need with our drag-and-drop analytics engine.' },
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-primary-100 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)] transition-all duration-500">
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 mb-8 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Scale-friendly pricing</h2>
                        <p className="text-slate-500 text-lg font-medium">Transparent billing that grows with your institution. No hidden fees, ever.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter Plan */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Starter</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-black text-slate-900">$49</span>
                                <span className="text-slate-400 font-bold">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {['Up to 200 Students', 'Standard Reporting', 'Email Support', 'Student Dashboard'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                                        <CheckCircle size={18} className="text-primary-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/login" className="block w-full py-4 bg-slate-50 text-slate-900 font-bold rounded-2xl text-center hover:bg-slate-100 transition-colors">
                                Get Started
                            </Link>
                        </div>

                        {/* Growth Plan (Highlighted) */}
                        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-primary-600 shadow-2xl shadow-primary-500/10 relative transform lg:-translate-y-6 flex flex-col">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full">MOST POPULAR</div>
                            <h3 className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-4">Growth</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-black text-slate-900">$199</span>
                                <span className="text-slate-400 font-bold">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {['Up to 1,000 Students', 'Advanced Analytics', 'Priority 1h Support', 'Custom Timetables', 'Automated Grading', 'Parent Portal'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                                        <CheckCircle size={18} className="text-primary-600" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/login" className="block w-full py-4 bg-primary-600 text-white font-bold rounded-2xl text-center hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30">
                                Try for Free
                            </Link>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Enterprise</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-black text-slate-900">Custom</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {['Unlimited Students', 'API Integration', 'Dedicated Manager', 'SSO/SAML Support', 'Whitelabeling'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                                        <CheckCircle size={18} className="text-primary-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button className="block w-full py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl text-center hover:bg-slate-50 transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-32 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 text-center mb-20 tracking-tight">Questions? <br />We've got answers.</h2>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="border border-slate-100 rounded-2xl overflow-hidden hover:border-primary-200 transition-all duration-300"
                            >
                                <button
                                    className="w-full flex items-center justify-between p-6 text-left"
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                >
                                    <span className="font-bold text-lg text-slate-800">{faq.q}</span>
                                    <div className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}>
                                        {openFaq === idx ? <Minus size={20} /> : <Plus size={20} />}
                                    </div>
                                </button>
                                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 pb-6' : 'max-h-0'}`}>
                                    <p className="text-slate-500 font-medium">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-primary-600 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary-500/20">
                        {/* Decorative background for CTA circle */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to transform Your <br />institution?</h2>
                            <p className="text-primary-100 text-lg md:text-xl font-semibold mb-12 max-w-2xl mx-auto">Join the hundreds of schools already using EduManager to power their educational experience.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link to="/login" className="px-10 py-4 bg-white text-primary-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all">
                                    Start 14-Day Free Trial
                                </Link>
                                <button className="text-white font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                    Talk to an Expert <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 pt-24 pb-12 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-white mb-6">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                                    <BookOpen size={20} />
                                </div>
                                EduManager
                            </div>
                            <p className="max-w-xs text-slate-400 font-medium leading-relaxed mb-8">
                                Building the future of educational administration. Secure, intelligent, and built for everyone.
                            </p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer">
                                        <div className="w-5 h-5 bg-slate-400 mask-star"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Platform</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Enterprise</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Company</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Press</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Support</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">API Docs</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">System Status</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-semibold text-slate-500">
                        <p>© 2024 EduManager Technologies Inc. Made with passion for education.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>

                {/* Big decorative background text */}
                <div className="absolute -bottom-10 -right-20 text-[20rem] font-black text-white/5 pointer-events-none select-none leading-none">EDU</div>
            </footer>

            {/* CSS for animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0) scale(1.1); }
                    50% { transform: translateY(20px) scale(1); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default LandingPage;
