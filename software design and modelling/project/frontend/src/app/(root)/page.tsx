"use client";
import { useState } from "react";
import Cards from "./components_home/cards";
import FilterBar from "@/src/app/(root)/components_home/FilterBar";
import { useUIStore } from "@/src/stores/ui.store";
import LoadingSpinner from "@/src/components/LoadingSpinner";


const HomePage = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  if (useUIStore((state) => state.loading.global)) return <LoadingSpinner />;

  return (
    <div className='w-full min-h-screen p-4'
      style={{
        color: "var(--white)"
      }}>

      <h1 className="text-3xl font-bold">  </h1>
       <div className='mb-8'>
        <FilterBar activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
        <Cards filters={activeFilters} />
       </div>

    </div>
  )
}

export default HomePage
