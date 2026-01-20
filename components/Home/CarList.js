import { CarListData } from "../../utils/CarListData";
import React, { useState } from "react";
import CarListItem from "./CarListItem";
import { useRouter } from "next/navigation";

function CarList({ distanceKm, pickup, dropoff }) {
  const [activeIndex, setActiveIndex] = useState();
  const [selectedCar, setSelectedCar] = useState();
  const router = useRouter();

  const handleRequest = () => {
    if (!pickup || !dropoff || !distanceKm || !selectedCar) return;

    const amount = (selectedCar.amount * distanceKm).toFixed(2);

    const params = new URLSearchParams({
      amount: String(amount),
      pickup: JSON.stringify(pickup),
      dropoff: JSON.stringify(dropoff),
      distanceKm: String(distanceKm),
      carType: selectedCar.name,
    });

    router.push(`/payment?${params.toString()}`);
  };

  return (
    <>
      {/* CAR LIST */}
      <div className="mt-5 p-5 overflow-y-auto max-h-[calc(100vh-260px)] md:max-h-[calc(100vh-220px)] lg:max-h-[calc(100vh-440px)] ">
        <h2 className="text-[22px] font-bold">Recommended</h2>

        {CarListData.map((item, index) => (
          <div
            key={item.id}
            className={`cursor-pointer p-1 px-4 border-black rounded-md ${activeIndex === index ? "border-[3px]" : ""
              }`}
            onClick={() => {
              setActiveIndex(index);
              setSelectedCar(item);
            }}
          >
            <CarListItem car={item} distanceKm={distanceKm} />
          </div>
        ))}

        {/* DESKTOP / WEB BUTTON (UNCHANGED DESIGN) */}
        {selectedCar?.name && (
          <div className="hidden md:flex justify-between fixed bottom-5 bg-white p-3 shadow-xl rounded-lg w-full md:w-[30%] border-[1px] items-center">
            <h2>Make Payment</h2>
            <button
              className="p-3 bg-black text-white rounded-lg text-center"
              onClick={handleRequest}
            >
              Request {selectedCar.name}
            </button>
          </div>
        )}
      </div>

      {/* MOBILE FIXED MAKE PAYMENT (VIEWPORT LEVEL) */}
      {selectedCar?.name && (
        <div
          className="
          md:hidden
          fixed
          bottom-4
          left-4
          right-4
          z-[9999]
          bg-white
          border
          shadow-2xl
          p-4
          rounded-lg
          flex
          items-center
          justify-between
        "
        >
          <h2 className="font-medium">Make Payment</h2>

          <button
            className="bg-black text-white px-5 py-2 rounded-lg"
            onClick={handleRequest}
          >
            Request {selectedCar.name}
          </button>
        </div>
      )}
    </>
  );

}

export default CarList;
