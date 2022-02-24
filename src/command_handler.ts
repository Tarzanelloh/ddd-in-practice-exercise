import { AddReservation, DomainEvent, RemoveReservation, Reservations } from "./event_store"
import { v4 as uuid } from "uuid"

export interface DomainCommand {
    id: string
    type: string
    payload: any
}

export interface CommandHandler {
	handle(domainCmd: DomainCommand): void
	backend: CommandHandler | undefined
}

export class ReserveSeatHandler implements CommandHandler {
	backend: CommandHandler | undefined

	constructor(private _events: DomainEvent[], private publish: (e: DomainEvent) => void, backend?: CommandHandler) {
		this.backend = backend
	}

	handle(cmd: ReserveSeat) {
        const screening = new Screening(cmd.payload.idScreening, this._events, this.publish)
		screening.reserveSeat(cmd.payload.idSeat, cmd.payload.idReservation)
        if (this.backend) {
		    this.backend.handle(cmd)
        }
	}
}

class Screening {
    private reservations: Reservations
    private events: DomainEvent[]
    constructor(private idScreening: string, _events: DomainEvent[], private publish: (e: DomainEvent) => void) {
        this.events = _events.filter(e => {
            return (e instanceof RemoveReservation) || (e instanceof AddReservation && e.idScreening === this.idScreening)
        })
        this.reservations = new Reservations(this.events)
    }

    reserveSeat(idSeat: string, idReservation: string) {
        if(this.isSeatAvailable(idSeat)) {
			this.publish(AddReservation.from(idSeat, this.idScreening, idReservation))
		} else {
			console.error(`Seat ${idSeat} not available for screening ${this.idScreening}`)
		}
    }

    private isSeatAvailable(idSeat: string): boolean {
        return !this.reservations.seats.find(s => s.idSeat === idSeat)
    }

}

export class ReserveSeat implements DomainCommand {
    id: string
    type = "reserve_seat"
    private constructor(public payload: { idScreening: string, idSeat: string, idReservation: string }) {
        this.id = uuid()
    }

    static from(idSeat: string, idScreening: string, idReservation: string): ReserveSeat {
        return new ReserveSeat({ idScreening, idSeat, idReservation })
    }
}
