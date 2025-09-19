"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Firestore
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const StarRating = ({ rating }) => {
  const stars = Array(5).fill(0).map((_, i) => (
    <span key={i} className={`text-2xl ${i < rating ? "text-yellow-500" : "text-gray-400"}`}>
      &#9733;
    </span>
  ));
  return <div className="flex justify-center my-2">{stars}</div>;
};

export default function Testimonials() {
  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const [testimonialsData, setTestimonialsData] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        imageSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3",
      }));
      setTestimonialsData(reviews);
    };
    fetchReviews();
  }, []);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center p-4 bg-gray-700 bg-[url('https://images.hermanmiller.group/asset/71152b06-815b-4262-bb22-e9e73ab5a7f6/W/HM_2596142_100676200_isa_foxtrot_walnut_v1_007.png?auto=format&mediaId=71152B06-815B-4262-BB22E9E73AB5A7F6&rect=0%2C.4301%2C.9999%2C.5627&auto=format&w=1000&q=50')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container relative z-10 max-w-lg mx-auto">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {testimonialsData.length === 0 ? (
              <CarouselItem key="empty">
                <div className="p-1 text-center text-white">
                  <p>No reviews yet. Be the first to submit one!</p>
                </div>
              </CarouselItem>
            ) : (
              testimonialsData.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <div className="p-1">
                    <Card className="relative rounded-xl p-8 border-none bg-white/10 backdrop-blur-sm text-white shadow-xl">
                      <div className="absolute inset-0 bg-stone-700/50 rounded-xl"></div>
                      <CardContent className="relative flex flex-col items-center justify-center p-0 text-center text-white">
                        <h2 className="text-xl font-bold uppercase mb-4">Client Review</h2>
                        <div className="relative w-24 h-24 mb-6 rounded-full overflow-hidden border-2 border-gray-600">
                          <Image src={testimonial.imageSrc} alt={testimonial.name} fill style={{ objectFit: "cover" }} className="rounded-full" />
                        </div>
                        <p className="text-lg mb-4 leading-relaxed">{testimonial.reviewText}</p>
                        <StarRating rating={testimonial.rating} />
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white text-black hover:bg-gray-200" />
          <CarouselNext className="right-4 bg-white text-black hover:bg-gray-200" />
        </Carousel>
      </div>
    </div>
  );
}
