export interface ILink {
  text: string;
  name?: string;
  is_internal_link?: boolean;
  url?: string;
  links?: ILink[];
}
