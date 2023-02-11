import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  tap,
  map,
  mergeMap,
} from 'rxjs';
import { NbaService } from '../nba.service';
import { Game, Stats, Team } from '../data.models';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css'],
})
export class TeamStatsComponent implements OnInit, OnChanges {
  @Input()
  team!: Team;

  @Input() noOfDays: number = 12;

  games$!: Observable<Game[]>;
  stats!: Stats;
  isModalVisible: boolean = false;

  private currentTeam: Team | null = null;
  private changeSubject = new BehaviorSubject<boolean>(true);

  constructor(protected nbaService: NbaService) {}

  ngOnInit(): void {
    this.games$ = this.changeSubject.pipe(
      mergeMap(() =>
        this.nbaService
          .getLastResults(this.team, this.noOfDays)
          .pipe(
            tap(
              (games) =>
                (this.stats = this.nbaService.getStatsFromGames(
                  games,
                  this.team
                ))
            )
          )
      )
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !changes['noOfDays'].firstChange &&
      changes['noOfDays'].previousValue !== changes['noOfDays'].currentValue
    ) {
      this.changeSubject.next(true);
    }
  }

  removeStats(team: Team): void {
    this.isModalVisible = true;
    this.currentTeam = team;
  }

  closeModal(isConfirmed: boolean): void {
    this.isModalVisible = false;
    if (isConfirmed && this.currentTeam) {
      this.nbaService.removeTrackedTeam(this.currentTeam);
    }
    this.currentTeam = null;
    // this.nbaService.removeTrackedTeam(team);
  }
}
