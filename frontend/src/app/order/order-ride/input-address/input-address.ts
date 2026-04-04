import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { MapboxApiService, PlaceSuggestion } from "../../../map/service/mapbox-api.service";
import { Point } from "../../../map/model/point";

@Component({
    selector: 'input-address',
    templateUrl: './input-address.html',
    styleUrls: ['./input-address.scss'],
    standalone: false
})
export class InputAddressComponent implements OnChanges {

    @Input() label: string = 'Address';
    @Input() placeholder: string = 'Enter address';
    @Input() disabled: boolean = false;
    @Input() minQueryLength: number = 2;
    @Input() point: Point | undefined = undefined;

    @Output() valueChange = new EventEmitter<PlaceSuggestion>();
    @Output() mapPickRequested = new EventEmitter<void>();

    public value: string = '';

    suggestions: PlaceSuggestion[] = [];
    isLoadingSuggestions = false;

    constructor(
        private mapboxApiService: MapboxApiService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['point'] && this.point) {
            this.mapboxApiService.getAddressFromCoordinates(this.point.lat, this.point.lng).then(address => {
                this.value = address;
                this.cdr.detectChanges();
            });
        }
    }

    public onInputChange(nextValue: string): void {
        this.value = nextValue;
        this.searchSuggestions(nextValue);
    }

    public onSelectSuggestion(suggestion: PlaceSuggestion): void {
        this.value = suggestion.placeName;
        this.valueChange.emit(suggestion);
        this.suggestions = [];
    }

    public onMapPickClick(): void {
        this.mapPickRequested.emit();
    }

    public clearSuggestions(): void {
        this.suggestions = [];
    }

    private async searchSuggestions(query: string): Promise<void> {
        const normalizedQuery = query.trim();
        if (normalizedQuery.length < this.minQueryLength || this.disabled) {
            this.suggestions = [];
            this.isLoadingSuggestions = false;
            return;
        }

        this.isLoadingSuggestions = true;
        this.mapboxApiService.searchPlaces(normalizedQuery).then(suggestions => {
            this.suggestions = suggestions;
            this.isLoadingSuggestions = false;
        });
    }
}
