import Image from 'next/image'
import React from 'react'
import { HiUser } from "react-icons/hi2";

function CarListItem({ car,distanceKm }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap lg:flex-nowrap">
        <div className='flex items-center gap-5'>
          <Image src={car.image} width={100} height={100} alt={car.name || "Car image"} />
          <div className="flex-1 min-w-0">
            <h2 className='font-semibold truncate md:whitespace-normal'>{car.name}

              <span className='flex gap-2 font-normal text-[14px] items-center'>
                <HiUser/>{car.seat}
              </span>
            </h2>
            <p className="text-sm text-gray-600">{car.desc}</p>
          </div>
        </div>
        <h2 className='shrink-0 font-bold whitespace-nowrap'>₹{(car.amount * distanceKm).toFixed(2)}</h2>
      </div>
    </div>
  )
}

export default CarListItem