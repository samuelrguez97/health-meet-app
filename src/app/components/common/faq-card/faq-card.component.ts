import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq-card',
  templateUrl: './faq-card.component.html',
  styleUrls: ['./faq-card.component.css']
})
export class FaqCardComponent implements OnInit {

  constructor() { }

  @Input() title: string;
  @Input() text: string;

  opened: boolean = false;
  isCollapsed: boolean = true;

  ngOnInit(): void {
  }

  toggle(): void {
    this.opened = !this.opened;
  }

}
