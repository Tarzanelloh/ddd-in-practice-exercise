import { ReserveSeat } from "../src/command_handler";
import { AddReservation, DomainEvent } from "../src/event_store";
import { CustomTest } from "./test_framework";
import { v4 as uuid } from "uuid"

let history: DomainEvent[] = []
let idSeat = uuid()
let idScreening = uuid()
let idReservation = uuid()
let expected = [AddReservation.from(idSeat, idScreening, idReservation)]
const reserveOneSeat = CustomTest.from("It should reserve a seat", history, ReserveSeat.from(idSeat, idScreening, idReservation), expected)
reserveOneSeat.run()

history = expected.slice()
expected = []
idReservation = uuid()
const seatCannotBeReservedTwice = CustomTest.from("It should not reserve the same seat twice", history, ReserveSeat.from(idSeat, idScreening, idReservation), expected)
seatCannotBeReservedTwice.run()
