import { Component, OnDestroy, OnInit } from '@angular/core';
import { Division, Team } from '../data.models';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { NbaService } from '../nba.service';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.css'],
})
export class GameStatsComponent implements OnInit, OnDestroy {
  public readonly Conferences = [
    { id: 'East', name: 'Eastern Conference' },
    { id: 'West', name: 'Western Conference' },
  ];
  public readonly Divisions: Division[] = [
    { con: 'West', id: 'Northwest', name: 'Northwest Division' },
    { con: 'West', id: 'Pacific', name: 'Pacific Division' },
    { con: 'West', id: 'Southwest', name: 'Southwest Division' },
    { con: 'East', id: 'Atlantic', name: 'Atlantic Division' },
    { con: 'East', id: 'Central', name: 'Central Division' },
    { con: 'East', id: 'Southeast', name: 'Southeast Division' },
  ];
  public readonly days: number[] = [6, 12, 20];

  teams$: Observable<Team[]>;
  allTeams: Team[] = [];
  currentTeams: Team[] = [];
  currentDivisions: Division[] = this.Divisions;
  selectForm: FormGroup = this.formBuilder.group({
    con: '',
    div: '',
    team: '',
    noOfDay: 12,
  });

  private destroy$: Subject<boolean> = new Subject();

  get teamSelect(): AbstractControl | null {
    return this.selectForm.get('team');
  }

  get conSelect(): AbstractControl | null {
    return this.selectForm.get('con');
  }

  get divSelect(): AbstractControl | null {
    return this.selectForm.get('div');
  }

  get noOfDaySelect(): AbstractControl | null {
    return this.selectForm.get('noOfDay');
  }

  constructor(
    protected nbaService: NbaService,
    private formBuilder: FormBuilder
  ) {
    this.teams$ = nbaService.getAllTeams().pipe(
      tap((data) => {
        this.allTeams = data;
        this.setCurrentTeams();
      })
    );
  }

  ngOnInit(): void {
    this.conSelect?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.setCurrentDivisions();
      });
    this.divSelect?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.setCurrentTeams();
      });
  }

  trackTeam(teamId: string): void {
    let team = this.allTeams.find((team) => team.id == Number(teamId));
    if (team) this.nbaService.addTrackedTeam(team);
  }

  private setCurrentTeams(): void {
    this.currentTeams = this.nbaService.getTeamsByFiltered({
      teams: this.allTeams,
      con: this.conSelect?.value,
      div: this.divSelect?.value,
    });
    this.teamSelect?.setValue(this.currentTeams[0].id);
  }

  private setCurrentDivisions(): void {
    if (!this.conSelect?.value) {
      this.currentDivisions = this.Divisions;
      this.divSelect?.setValue('');
      return;
    }
    this.currentDivisions = this.nbaService.getDivisionFiltered({
      divisions: this.Divisions,
      conference: this.conSelect?.value,
    });
    this.divSelect?.setValue(this.currentDivisions[0].id);
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
