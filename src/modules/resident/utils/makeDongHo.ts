interface ApartmentRange {
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
}

export const makeDong = (apt: ApartmentRange) => {
  return {
    min: apt.startComplexNumber * 100 + apt.startDongNumber,
    max: apt.endComplexNumber * 100 + apt.endDongNumber,
  };
};
export const makeHo = (apt: ApartmentRange) => {
  return {
    min: apt.startFloorNumber * 100 + apt.startHoNumber,
    max: apt.endFloorNumber * 100 + apt.endHoNumber,
  };
};
