import { Component, Input, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from './../../services/common.service';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';

@Component({
  selector: 'nit-mat-table',
  templateUrl: './nit-mat-table.component.html',
  providers: [{ provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: 'check' }]
})
export class NITMatTableComponent<TRows> implements OnInit {
  @Input() dataSource: MatTableDataSource<TRows>;
  @Input() displayedColumns: string[] = [];
  @Input() isDisabled: boolean = false;
  selection: SelectionModel<TRows>;

  constructor(public common: CommonService) {}

  ngOnInit(): void {
    const initialSelection = [];
    const allowMultiSelect = true;
    this.selection = new SelectionModel<TRows>(
      allowMultiSelect,
      initialSelection
    );
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
