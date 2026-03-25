interface ApartmentRange {
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
}

export const makeDong = (apt: ApartmentRange) => {
  return {
    min: apt.startComplexNumber * 100 + apt.startDongNumber,
    max: apt.endComplexNumber * 100 + apt.endDongNumber,
  };
};
