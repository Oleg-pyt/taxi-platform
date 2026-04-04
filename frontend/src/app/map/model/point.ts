import { PointType } from "./point-type";

export interface Point {
    lat: number;
    lng: number;
    pointType: PointType;
}