import {Message} from "@/types/chat/message";
import {Room} from "@/types/chat/room";

export type Client = object & {
    enabled: boolean,
    messages: Message[],
    rooms: Room[],
    main: boolean,
    name: string
}
