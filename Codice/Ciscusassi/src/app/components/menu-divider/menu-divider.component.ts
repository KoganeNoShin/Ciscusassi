import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-menu-divider',
  templateUrl: './menu-divider.component.html',
  styleUrls: ['./menu-divider.component.scss'],
  standalone: true,
})
export class MenuDividerComponent implements OnInit {

  @Input() title: string = "";
  @Input() backgroundURL: string = "";

  constructor() { }

  ngOnInit() { }

}
