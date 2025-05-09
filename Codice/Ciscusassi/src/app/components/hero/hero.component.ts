import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  standalone: true,
})
export class HeroComponent implements OnInit {

  @Input() title: string = "";
  @Input() description: string = "";
  @Input() backgroundURL: string = "";

  constructor() { }

  ngOnInit() { }

}
