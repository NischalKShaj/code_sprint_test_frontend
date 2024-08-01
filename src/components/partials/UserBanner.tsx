"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import dotenv from "dotenv";
dotenv.config();

const UserBanner = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/`
        );
        if (response.status === 202) {
          const images = response.data.map((banner: any) => banner.bannerImage);
          console.log("Fetched Images:", images); // Debug log
          setBannerImages(images);
        }
      } catch (error) {
        console.error("Error fetching banner images:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop={true}
        autoPlay={true}
        dynamicHeight={false}
        className="w-full h-56 sm:h-72 md:h-80 lg:h-96 xl:h-[30rem]" // Set heights for different breakpoints
      >
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 xl:h-[30rem]"
          >
            <Image
              src={image}
              alt={`Slide ${index}`}
              layout="fill"
              objectPosition="center"
              className="rounded-lg"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default UserBanner;
