import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  ViewChild,
  SimpleChanges
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'nit-mat-table',
  templateUrl: './nit-mat-table.component.html',
  providers: [{ provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: 'check' }]
})
export class NITMatTableComponent<TRows> implements OnInit, OnChanges {
  @Input() dataSource: MatTableDataSource<TRows>;
  @Input() displayedColumns: string[] = [];
  @Input() isDisabled: boolean = false;
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  public pageSize: number = 25;
  private selection: SelectionModel<TRows>;

  constructor() {}
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    const initialSelection = [];
    const allowMultiSelect = true;
    this.selection = new SelectionModel<TRows>(
      allowMultiSelect,
      initialSelection
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(SimpleChanges: SimpleChanges) {
    const { dataSource } = SimpleChanges;

    if (dataSource && this.paginator && this.sort) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    return numSelected === this.dataSource.connect().value.length;
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource
          ?.connect()
          ?.value.forEach(row => this.selection.select(row));
  }
}
