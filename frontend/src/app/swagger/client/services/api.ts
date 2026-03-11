export * from './admin.service';
import { AdminService } from './admin.service';
export * from './rides.service';
import { RidesService } from './rides.service';
export * from './users.service';
import { UsersService } from './users.service';
export * from './websocket.service';
import { WebsocketService } from './websocket.service';
export const APIS = [AdminService, RidesService, UsersService, WebsocketService];
