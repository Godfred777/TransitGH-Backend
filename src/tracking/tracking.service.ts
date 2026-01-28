import { Injectable } from '@nestjs/common';
import * as turf from '@turf/turf'; // Import the whole library
// OR import specific modules for smaller bundle size:
// import { point } from '@turf/helpers';
// import distance from '@turf/distance';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TrackingService {
  /**
   * Checks if a bus is close enough to a stop to call it "ARRIVED"
   * 
   */

    constructor(private prisma: PrismaService) {}


  checkArrivalStatus(
    busLat: number,
    busLong: number,
    stopLat: number,
    stopLong: number,
  ) {
    // 1. Create Turf "Points"
    const busLocation = turf.point([busLong, busLat]); // Note: [Longitude, Latitude]
    const stopLocation = turf.point([stopLong, stopLat]);

    // 2. Calculate Distance (in Kilometers by default)
    const distanceKm = turf.distance(busLocation, stopLocation, {
      units: 'kilometers',
    });
    const distanceMeters = distanceKm * 1000;

    console.log(`Bus is ${distanceMeters.toFixed(2)} meters away.`);

    // 3. The "Geofence" Check (e.g., 50 meters)
    if (distanceMeters <= 50) {
      return true; // TRIGGER ARRIVAL EVENT!
    }

    return false;
  }

  sortStopsByDistance(userLat: number, userLong: number, routeStops: any[]) {
    const userPoint = turf.point([userLong, userLat]);

    return routeStops
      .map((stop) => {
        const stopPoint = turf.point([stop.longitude, stop.latitude]);
        const dist = turf.distance(userPoint, stopPoint, { units: 'meters' });
        return { ...stop, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);
  }

  // Assuming you have the full "Route Line" as a GeoJSON LineString
  getRouteSegment(
    startLat: number,
    startLong: number,
    endLat: number,
    endLong: number,
    fullRouteLine: any,
  ) {
    const startPt = turf.point([startLong, startLat]);
    const endPt = turf.point([endLong, endLat]);

    return turf.lineSlice(startPt, endPt, fullRouteLine);
  }

}