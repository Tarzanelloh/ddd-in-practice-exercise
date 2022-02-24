import { inspect } from "util";
import { DomainCommand, ReserveSeat, ReserveSeatHandler } from "../src/command_handler";
import { DomainEvent } from "../src/event_store";

export class CustomTest {
    _history: DomainEvent[] | undefined
    _publishedEvents: DomainEvent[] = []
    _expected: DomainEvent[] = []

    private constructor(private name: string) {}

    given(_events: DomainEvent[]): CustomTest {
        this._history = _events
        return this
    }
    
    when(cmd: DomainCommand): CustomTest {
        if (!this._history) {
            throw new Error("Called when before given")
        }
        const handler = new ReserveSeatHandler(this._history, (e: DomainEvent) => this._publishedEvents.push(e))
        handler.handle(cmd)
        return this
    }
    
    expect(expected: DomainEvent[]): CustomTest {
        this._expected = expected
        return this
    }

    run() {
        if (this._expected.length != this._publishedEvents.length || !this._expected.every((e, i) => areEqual(e, this._publishedEvents[i]))) {
            throw Error(`
            ${this.name} encountered an error!
            Expected events and published events are not equal:
            Expected: ${inspect(this._expected)},
            Received: ${inspect(this._publishedEvents)}`)
        } else {
            console.log(`"${this.name}": ran successfully!`)
        }
    }

    static from(name: string, given: DomainEvent[], when: DomainCommand, expected: DomainEvent[]): CustomTest {
        const test = new CustomTest(name)
        test.given(given)
        test.when(when)
        test.expect(expected)
        return test
    }
}

const areEqual = (e1: DomainEvent, e2: DomainEvent) => {
    return (e1.type === e2.type && e1.idReservation === e2.idReservation)
}