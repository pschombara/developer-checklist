import type {Message} from "@/types/chat/message";
import type {Room} from "@/types/chat/room";

export type Client = object & {
    enabled: boolean,
    messages: Message[],
    rooms: Room[],
    main: boolean,
    name: string
}
