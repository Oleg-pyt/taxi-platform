import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LocationService } from './service/location.service';
import { MapboxApiService } from './service/mapbox-api.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    LocationService,
    MapboxApiService
  ]
})
export class MapModule { }
