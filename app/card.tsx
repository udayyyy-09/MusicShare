"use client"
import React from 'react'

function CardUI() {
  const [stopScroll, setStopScroll] = React.useState(false);
    const cardData = [
        {
            title: "one of uday's favorite things",
            image: "/img1.jpg",
        },
        {
            title: "choti UJ",
            image: "/img2.jpg",
        },
        {
            title: "??😔😔",
            image: "/img3.jpg",
        },
        {
            title: "UJ",
            image: "/img4.jpg",
        },
        {
            title: "The day I owe you, you are not allowed to look anygirl",
            image: "/img5.jpg",
        },
    ];

    return (
        <>
            <style>{`
                .marquee-inner {
                    animation: marqueeScroll linear infinite;
                }

                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0%);
                    }

                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>

            <div className="overflow-hidden w-full relative max-w-6xl mx-auto" onMouseEnter={() => setStopScroll(true)} onMouseLeave={() => setStopScroll(false)}>
                <div className="absolute left-0 top-0 h-full w-40 z-10 pointer-events-none " />
                <div className="marquee-inner flex w-fit" style={{ animationPlayState: stopScroll ? "paused" : "running", animationDuration: cardData.length * 2500 + "ms" }}>
                    <div className="flex">
                        {[...cardData, ...cardData].map((card, index) => (
                            <div key={index} className="w-80 mx-4 h-[30rem] relative group hover:scale-90 transition-all duration-300">
                                <img src={card.image} alt="card" className="w-full h-full object-cover" />
                                <div className="flex items-center justify-center px-4 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-0 backdrop-blur-md left-0 w-full h-full bg-black/20">
                                    <p className="text-white text-xl font-semibold text-center">{card.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[#F5F7FF] to-transparent" />
            </div>
        </>
    );
}

export default CardUI;
