import { IconPipe, IconRef } from './icon.pipe';

describe('IconPipe', () => {
  const pipe = new IconPipe();

  it('returns icon data from its predefined hash table by given hash', () => {
    const iconKey: IconRef = 'bell';
    const iconData = (<any>pipe).iconNameMap[iconKey];

    expect(pipe.transform(iconKey)).toEqual([
      iconData.prefix,
      iconData.iconName,
    ]);
  });
});
