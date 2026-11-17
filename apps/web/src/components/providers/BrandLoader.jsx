"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "@/store/thunks/brandThunks";

const BrandLoader = () => {
  const dispatch = useDispatch();

  const { fetched, loading } = useSelector(
    (state) => state.brands
  );

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(fetchBrands());
    }
  }, [dispatch, fetched, loading]);

  return null;
};

export default BrandLoader;