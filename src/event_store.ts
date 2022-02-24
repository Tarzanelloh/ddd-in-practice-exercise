import { v4 as uuid } from "uuid"

export interface DomainEvent {
    idEvent: string
    type: string
    idReservation: string
}

export class AddReservation implements DomainEvent {
    idEvent: string
    type = "add_reservation"

    private constructor(public idSeat: string, public idScreening: string, public idReservation: string) {
        this.idEvent = uuid()
    }

    static from(idSeat: string, idScreening: string, idReservation: string): AddReservation {
        return new AddReservation(idSeat, idScreening, idReservation)
    }
}

export class RemoveReservation implements DomainEvent {
    idEvent: string
    type = "remove_reservation"

    private constructor(public idReservation: string) {
        this.idEvent = uuid()
    }

    static from(idReservation: string): RemoveReservation {
        return new RemoveReservation(idReservation)
    }
}

export class ReservedSeat {
    constructor(public idSeat: string, public idReservation: string) { }
}

export class Reservations {
    seats: ReservedSeat[]
    constructor(_events: DomainEvent[]) {
        this.seats = []
        _events.forEach(e => this.apply(e))
    }

    apply(event: DomainEvent) {
        if (event instanceof AddReservation) {
            this.seats.push(new ReservedSeat(event.idSeat, event.idScreening))
        }
        if (event instanceof RemoveReservation) {
            this.seats = this.seats.filter(s => s.idReservation != event.idReservation)
        }
    }
}
