import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BookingsService {

    constructor(private readonly prisma: PrismaService) {}

    async checkSeatAvailability(tripId: number, pickupSeq: number, dropoffSeq: number) {
    // 1. Get the vehicle capacity for this trip
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: { vehicle: true },
        });

        if (!trip) {
            throw new Error(`Trip with ID ${tripId} not found`);
        }

        const totalSeats = trip.vehicle.capacity;

        // 2. Find all "Occupied" seats that OVERLAP with this requested segment
        // NOTE: This includes CONFIRMED bookings AND valid PENDING bookings (locks)
        const occupiedSeats = await this.prisma.booking.findMany({
            where: {
            tripId: tripId,
            paymentStatus: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }, // Count held seats as taken!
            // THE GOLDEN FORMULA:
            AND: [
                { pickupSeq: { lt: dropoffSeq } }, // They start before I end
                { dropoffSeq: { gt: pickupSeq } }, // They end after I start
            ],
            },
            select: { seatNumber: true },
        });

        // 3. Calculate Available Seats
        const occupiedSeatNumbers = occupiedSeats.map((b) => b.seatNumber);
        
        // Create an array of all possible seats [1, 2, ... 15]
        const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
        
        // Filter out the taken ones
        const availableSeats = allSeats.filter((seat) => !occupiedSeatNumbers.includes(seat));

        return availableSeats;
    }


    async findAll() {
        return this.prisma.booking.findMany()
    }

    async findAllByUserId(userId: number) {
        return this.prisma.booking.findMany({
            where: {
                userId,
            },
        });
    }

    async findOne(id: number) {
        return this.prisma.booking.findUnique({
            where: {
                id,
            },
        });
    }

    async create(data: Prisma.BookingCreateInput) {
        
        const tripId = (data.trip as any)?.connect?.id || (data.trip as any)?.id;
        
        const availableSeats = await this.checkSeatAvailability(
            tripId,
            data.pickupSeq,
            data.dropoffSeq,
        );

        if (availableSeats.length === 0) {
            throw new Error('No available seats for the selected trip and segment');
        }

        const seatNumber = availableSeats[0]; // Assign the first available seat

        return this.prisma.booking.create({
            data: {
                ...data,
                seatNumber,
            },
        });
    }

    async update(id: number, data: Partial<Prisma.BookingUpdateInput>) {
        
        const existingBooking = await this.prisma.booking.findUnique({
            where: { id },
        });

        if (!existingBooking) {
            throw new Error(`Booking with ID ${id} not found`);
        }

        // If tripId, pickupSeq, or dropoffSeq are being updated, recheck seat availability
        const tripId = data.trip
            ? (data.trip as any)?.connect?.id || (data.trip as any)?.id
            : existingBooking.tripId;
        const pickupSeq = typeof data.pickupSeq === 'number' 
            ? data.pickupSeq 
            : (data.pickupSeq as any)?.set ?? existingBooking.pickupSeq;
        const dropoffSeq = typeof data.dropoffSeq === 'number' 
            ? data.dropoffSeq 
            : (data.dropoffSeq as any)?.set ?? existingBooking.dropoffSeq;

        const availableSeats = await this.checkSeatAvailability(
            tripId,
            pickupSeq,
            dropoffSeq,
        );
        // Include the existing seat number as available since the booking holds it
        availableSeats.push(existingBooking.seatNumber);

        if (availableSeats.length === 0) {
            throw new Error('No available seats for the selected trip and segment');
        }

        const requestedSeat = typeof data.seatNumber === 'number'
            ? data.seatNumber
            : availableSeats[0]; // Assign the first available seat
        return this.prisma.booking.update({
            where: {
                id,
            },
            data: {
                ...data,
                seatNumber: requestedSeat,
            },
        });
    }

    async delete(id: number) {
        return this.prisma.booking.delete({
            where: {
                id,
            },
        });
    }

    @Cron('*/1 * * * *') // Run every minute
    async releaseExpiredHolds() {
        await this.prisma.booking.updateMany({
            where: {
            paymentStatus: 'PENDING_PAYMENT',
            createdAt: {
                lte: new Date(Date.now() - 5 * 60 * 1000), // Older than 5 minutes
                },
            },
            data: {
                paymentStatus: 'CANCELLED',// or just delete the record
            },
        });
    }

}
