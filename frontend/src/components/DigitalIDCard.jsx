import React, { useState } from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';

const DigitalIDCard = ({ student, universityName }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!student) return null;

    return (
        <div className="perspective-1000 w-full max-w-sm mx-auto h-56 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full duration-700 preserve-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRONT SIDE */}
                <div className="absolute w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900 to-blue-700 text-white p-6 flex flex-col justify-between border border-blue-500/30">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <ShieldCheck size={24} className="text-blue-200" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{universityName || "University"}</h3>
                                <p className="text-xs text-blue-200 uppercase tracking-widest">Student ID</p>
                            </div>
                        </div>
                        <img
                            src={student.profilePicture || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="w-16 h-16 rounded-xl border-2 border-white/30 object-cover shadow-lg"
                        />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight shadow-black drop-shadow-md">{student.firstName} {student.lastName}</h2>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-blue-200 font-medium">{student.role}</p>
                                <p className="text-xs text-blue-300 mt-1">ID: {student.enrollmentNo || "N/A"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-blue-300">Valid Thru</p>
                                <p className="text-sm font-bold">12/26</p>
                            </div>
                        </div>
                    </div>

                    {/* Holographic effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>

                {/* BACK SIDE */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden shadow-2xl bg-gray-900 text-white p-6 flex flex-col items-center justify-center border border-gray-700">
                    <div className="bg-white p-3 rounded-xl mb-4">
                        <QrCode size={100} className="text-black" />
                    </div>
                    <p className="text-xs text-gray-400 text-center mb-2">Scan this code for Library & Gym Access</p>
                    <p className="text-xs text-gray-500 font-mono">{student._id}</p>

                    <div className="mt-4 w-full h-8 bg-white/10 rounded overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] tracking-[0.5em] text-white/30 font-bold">AUTHORIZED</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Tailwind utility need for 3d transform - usually standard in modern tailwind but ensuring utility classes work requires 'transform-style: preserve-3d' which might need custom css or a plugin. 
                I will add inline styles for safety if tailwind plugins aren't present.
            */}
            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};

export default DigitalIDCard;
