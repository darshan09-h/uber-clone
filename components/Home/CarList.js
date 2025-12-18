import { CarListData } from '../../utils/CarListData'
import React,{useState} from 'react'
import CarListItem from './CarListItem'
import { useRouter } from 'next/navigation';

function CarList({distanceKm}) {
  const [activeIndex, setActiveIndex] = useState();
  const [selectedCar, setSelectedCar] = useState();
  const router = useRouter();

  return (
    <div className='mt-5 p-5 overflow-auto h-[320px]'>
        <h2 className='text-[22px] font-bold'>Recommended</h2>
        {CarListData.map((item, index)=>(
            <div key={item.id} className={`cursor-pointer p-1 px-4 border-black rounded-md ${activeIndex==index?'border-[3px]':null}`} onClick={()=>{setActiveIndex(index);
              setSelectedCar(item)}}
              >   
                <CarListItem car={item} distanceKm={distanceKm}/>
            </div>
        ))}
        {selectedCar?.name? <div className='flex justify-between fixed bottom-5 bg-white p-3 shadow-xl rounded-lg w-full md:w-[30%] border-[1px] items-center'>
          <h2>Make Payement</h2>
          <button className='p-3 bg-black text-white rounded-lg text-center'
            onClick={()=>router.push('/payment?amount='+(selectedCar.amount*distanceKm).toFixed(2))}
            >Request {selectedCar.name}</button>
        </div>:null}
    </div>
  )
}

export default CarList